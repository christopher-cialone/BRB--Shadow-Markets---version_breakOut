using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Manages the day-night cycle in the game,
/// handling transitions and environment changes
/// </summary>
public class DayNightCycleManager : MonoBehaviour
{
    private static DayNightCycleManager _instance;
    public static DayNightCycleManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("DayNightCycleManager");
                _instance = obj.AddComponent<DayNightCycleManager>();
                DontDestroyOnLoad(obj);
            }
            return _instance;
        }
    }

    // Current time state
    public enum TimeState { Day, Transitioning, Night }
    public TimeState CurrentState { get; private set; } = TimeState.Day;
    
    // Time configuration
    [SerializeField] private float dayDuration = 300f; // 5 minutes per day
    [SerializeField] private float nightDuration = 300f; // 5 minutes per night
    [SerializeField] private float transitionDuration = 10f; // 10 seconds for transition
    
    // Time tracking
    private float currentTime = 0f;
    private float totalDayLength;
    
    // Visual elements
    [SerializeField] private Image dayNightIndicator;
    [SerializeField] private Sprite sunSprite;
    [SerializeField] private Sprite moonSprite;
    
    // Environment elements
    [SerializeField] private GameObject dayEnvironment;
    [SerializeField] private GameObject nightEnvironment;
    
    // Transition overlay
    [SerializeField] private Image transitionOverlay;
    
    // Events
    public event Action<TimeState> OnTimeStateChanged;
    public event Action<float> OnTimeProgressed; // 0-1 progress through current day or night
    
    // Auto transition enabled flag
    public bool AutoTransitionEnabled { get; private set; } = true;

    private void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            // Initialize
            totalDayLength = dayDuration + nightDuration + (transitionDuration * 2);
            CurrentState = TimeState.Day;
            
            if (transitionOverlay != null)
            {
                transitionOverlay.color = new Color(0, 0, 0, 0); // Start transparent
            }
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        // Set initial state
        UpdateTimeIndicator();
        UpdateEnvironment();
    }
    
    private void Update()
    {
        if (!AutoTransitionEnabled) return;
        
        // Update time
        currentTime += Time.deltaTime;
        
        // Calculate cycle position (0-1)
        float cyclePortion = Mathf.Repeat(currentTime, totalDayLength) / totalDayLength;
        
        // Determine current state based on cycle position
        TimeState newState = DetermineTimeState(cyclePortion);
        
        // If state changed, trigger transition
        if (newState != CurrentState)
        {
            StartTransition(newState);
        }
        
        // Calculate progress within current state
        float stateProgress = CalculateStateProgress(cyclePortion);
        OnTimeProgressed?.Invoke(stateProgress);
    }
    
    /// <summary>
    /// Determine time state based on cycle portion (0-1)
    /// </summary>
    private TimeState DetermineTimeState(float cyclePortion)
    {
        float dayPortion = dayDuration / totalDayLength;
        float nightPortion = nightDuration / totalDayLength;
        float transitionPortion = transitionDuration / totalDayLength;
        
        if (cyclePortion < dayPortion)
        {
            return TimeState.Day;
        }
        else if (cyclePortion < dayPortion + transitionPortion)
        {
            return TimeState.Transitioning; // Day to night
        }
        else if (cyclePortion < dayPortion + transitionPortion + nightPortion)
        {
            return TimeState.Night;
        }
        else
        {
            return TimeState.Transitioning; // Night to day
        }
    }
    
    /// <summary>
    /// Calculate progress within current state (0-1)
    /// </summary>
    private float CalculateStateProgress(float cyclePortion)
    {
        float dayPortion = dayDuration / totalDayLength;
        float nightPortion = nightDuration / totalDayLength;
        float transitionPortion = transitionDuration / totalDayLength;
        
        if (CurrentState == TimeState.Day)
        {
            return Mathf.Clamp01(cyclePortion / dayPortion);
        }
        else if (CurrentState == TimeState.Night)
        {
            float nightStart = dayPortion + transitionPortion;
            return Mathf.Clamp01((cyclePortion - nightStart) / nightPortion);
        }
        else // Transitioning
        {
            if (cyclePortion < dayPortion + transitionPortion) // Day to night
            {
                float transitionStart = dayPortion;
                return Mathf.Clamp01((cyclePortion - transitionStart) / transitionPortion);
            }
            else // Night to day
            {
                float transitionStart = dayPortion + transitionPortion + nightPortion;
                return Mathf.Clamp01((cyclePortion - transitionStart) / transitionPortion);
            }
        }
    }
    
    /// <summary>
    /// Start transition to a new time state
    /// </summary>
    private void StartTransition(TimeState newState)
    {
        StartCoroutine(TransitionCoroutine(newState));
    }
    
    /// <summary>
    /// Transition coroutine
    /// </summary>
    private IEnumerator TransitionCoroutine(TimeState targetState)
    {
        // Set state to transitioning
        TimeState previousState = CurrentState;
        CurrentState = TimeState.Transitioning;
        OnTimeStateChanged?.Invoke(CurrentState);
        
        // Get the game manager to trigger scene transition if needed
        GameManager gameManager = GameManager.Instance;
        
        // Track if we need a scene change
        bool needsSceneChange = false;
        
        // If transitioning from day to night or night to day, change scene
        if (previousState == TimeState.Day && targetState == TimeState.Night)
        {
            // Transition from Cipher Gulch to Ether Range
            if (gameManager != null && gameManager.CurrentState == GameManager.GameState.DaytimeRanch)
            {
                needsSceneChange = true;
            }
        }
        else if (previousState == TimeState.Night && targetState == TimeState.Day)
        {
            // Transition from Ether Range to Cipher Gulch
            if (gameManager != null && gameManager.CurrentState == GameManager.GameState.EtherRange)
            {
                needsSceneChange = true;
            }
        }
        
        // Fade to black
        if (transitionOverlay != null)
        {
            // Fade to black
            float startTime = Time.time;
            float elapsedTime = 0f;
            
            while (elapsedTime < transitionDuration * 0.4f) // First 40% of transition is fade out
            {
                elapsedTime = Time.time - startTime;
                float normalizedTime = Mathf.Clamp01(elapsedTime / (transitionDuration * 0.4f));
                
                // Update overlay alpha
                Color overlayColor = transitionOverlay.color;
                overlayColor.a = Mathf.Lerp(0f, 1f, normalizedTime);
                transitionOverlay.color = overlayColor;
                
                yield return null;
            }
        }
        
        // Change scene if needed
        if (needsSceneChange)
        {
            if (targetState == TimeState.Night)
            {
                gameManager.LoadScene(GameManager.GameState.EtherRange);
            }
            else
            {
                gameManager.LoadScene(GameManager.GameState.DaytimeRanch);
            }
            
            // Wait for scene transition
            yield return new WaitForSeconds(1f);
        }
        
        // Update time state
        CurrentState = targetState;
        OnTimeStateChanged?.Invoke(CurrentState);
        
        // Update visuals
        UpdateTimeIndicator();
        UpdateEnvironment();
        
        // Fade back in
        if (transitionOverlay != null)
        {
            // Fade from black
            float startTime = Time.time;
            float elapsedTime = 0f;
            
            while (elapsedTime < transitionDuration * 0.4f) // Last 40% of transition is fade in
            {
                elapsedTime = Time.time - startTime;
                float normalizedTime = Mathf.Clamp01(elapsedTime / (transitionDuration * 0.4f));
                
                // Update overlay alpha
                Color overlayColor = transitionOverlay.color;
                overlayColor.a = Mathf.Lerp(1f, 0f, normalizedTime);
                transitionOverlay.color = overlayColor;
                
                yield return null;
            }
            
            // Ensure overlay is fully transparent
            Color finalColor = transitionOverlay.color;
            finalColor.a = 0f;
            transitionOverlay.color = finalColor;
        }
    }
    
    /// <summary>
    /// Update the time indicator (sun/moon) based on current state
    /// </summary>
    private void UpdateTimeIndicator()
    {
        if (dayNightIndicator == null) return;
        
        switch (CurrentState)
        {
            case TimeState.Day:
                dayNightIndicator.sprite = sunSprite;
                break;
            case TimeState.Night:
                dayNightIndicator.sprite = moonSprite;
                break;
        }
    }
    
    /// <summary>
    /// Update environment elements based on current state
    /// </summary>
    private void UpdateEnvironment()
    {
        if (dayEnvironment != null)
        {
            dayEnvironment.SetActive(CurrentState == TimeState.Day);
        }
        
        if (nightEnvironment != null)
        {
            nightEnvironment.SetActive(CurrentState == TimeState.Night);
        }
    }
    
    /// <summary>
    /// Manually set the time state (for testing or story events)
    /// </summary>
    public void SetTimeState(TimeState state, bool withTransition = true)
    {
        if (withTransition)
        {
            StartTransition(state);
        }
        else
        {
            // Force immediate change
            CurrentState = state;
            OnTimeStateChanged?.Invoke(CurrentState);
            UpdateTimeIndicator();
            UpdateEnvironment();
        }
    }
    
    /// <summary>
    /// Enable or disable auto time transitions
    /// </summary>
    public void SetAutoTransition(bool enabled)
    {
        AutoTransitionEnabled = enabled;
    }
    
    /// <summary>
    /// Set day and night durations
    /// </summary>
    public void SetCycleDurations(float day, float night, float transition)
    {
        dayDuration = day;
        nightDuration = night;
        transitionDuration = transition;
        totalDayLength = dayDuration + nightDuration + (transitionDuration * 2);
    }
    
    /// <summary>
    /// Get remaining time until next transition in seconds
    /// </summary>
    public float GetTimeUntilNextTransition()
    {
        float cyclePortion = Mathf.Repeat(currentTime, totalDayLength) / totalDayLength;
        
        if (CurrentState == TimeState.Day)
        {
            float dayPortion = dayDuration / totalDayLength;
            return (dayPortion - cyclePortion) * totalDayLength;
        }
        else if (CurrentState == TimeState.Night)
        {
            float dayPortion = dayDuration / totalDayLength;
            float transitionPortion = transitionDuration / totalDayLength;
            float nightPortion = nightDuration / totalDayLength;
            
            float nightStart = dayPortion + transitionPortion;
            float nightEnd = nightStart + nightPortion;
            
            return (nightEnd - cyclePortion) * totalDayLength;
        }
        
        // If transitioning, just return the transition duration
        return transitionDuration;
    }
    
    /// <summary>
    /// Get formatted time string showing current time state and remaining time
    /// </summary>
    public string GetTimeString()
    {
        float timeRemaining = GetTimeUntilNextTransition();
        int minutes = Mathf.FloorToInt(timeRemaining / 60f);
        int seconds = Mathf.FloorToInt(timeRemaining % 60f);
        
        string stateText = CurrentState == TimeState.Day ? "Day" : (CurrentState == TimeState.Night ? "Night" : "Transitioning");
        
        return $"{stateText} - {minutes:00}:{seconds:00} until {(CurrentState == TimeState.Day ? "night" : "day")}";
    }
}