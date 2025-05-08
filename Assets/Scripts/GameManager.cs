using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    // Singleton pattern for GameManager
    public static GameManager Instance { get; private set; }

    // Game state
    public enum GameState { MainMenu, DaytimeRanch, Saloon, EtherRange }
    public GameState CurrentState { get; private set; }

    // Day/Night cycle
    public bool IsNightTime { get; private set; }
    private float dayLengthInSeconds = 300f; // 5 minutes per day cycle
    private float timeSinceDayStarted = 0f;

    // References
    public PlayerData PlayerData { get; private set; }
    public UIManager UIManager { get; private set; }
    public TransitionManager TransitionManager { get; private set; }
    public SoundManager SoundManager { get; private set; }

    private void Awake()
    {
        // Singleton setup
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            // Initialize components
            PlayerData = GetComponent<PlayerData>() ?? gameObject.AddComponent<PlayerData>();
            UIManager = GetComponent<UIManager>() ?? gameObject.AddComponent<UIManager>();
            TransitionManager = GetComponent<TransitionManager>() ?? gameObject.AddComponent<TransitionManager>();
            SoundManager = GetComponent<SoundManager>() ?? gameObject.AddComponent<SoundManager>();
            
            // Set initial game state
            CurrentState = GameState.MainMenu;
            IsNightTime = false;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        // Load main menu scene
        LoadScene(GameState.MainMenu);
    }

    private void Update()
    {
        // Update day/night cycle if not in main menu
        if (CurrentState != GameState.MainMenu)
        {
            UpdateDayNightCycle();
        }
    }

    private void UpdateDayNightCycle()
    {
        timeSinceDayStarted += Time.deltaTime;
        
        if (timeSinceDayStarted >= dayLengthInSeconds)
        {
            timeSinceDayStarted = 0f;
            IsNightTime = !IsNightTime;
            
            // Transition to new scene based on day/night cycle
            if (IsNightTime && CurrentState == GameState.DaytimeRanch)
            {
                SwitchToNightScene();
            }
            else if (!IsNightTime && CurrentState == GameState.EtherRange)
            {
                SwitchToDayScene();
            }
        }
    }

    public void LoadScene(GameState newState)
    {
        string sceneName = "";
        
        switch (newState)
        {
            case GameState.MainMenu:
                sceneName = "MainMenu";
                break;
            case GameState.DaytimeRanch:
                sceneName = "DaytimeRanch";
                break;
            case GameState.Saloon:
                sceneName = "Saloon";
                break;
            case GameState.EtherRange:
                sceneName = "EtherRange";
                break;
        }
        
        StartCoroutine(TransitionToScene(sceneName, newState));
    }

    private IEnumerator TransitionToScene(string sceneName, GameState newState)
    {
        // Start transition animation
        TransitionManager.StartTransition();
        
        yield return new WaitForSeconds(1f);
        
        // Load the new scene
        SceneManager.LoadScene(sceneName);
        
        // Update game state
        CurrentState = newState;
        
        // End transition animation
        TransitionManager.EndTransition();
    }

    private void SwitchToDayScene()
    {
        LoadScene(GameState.DaytimeRanch);
    }

    private void SwitchToNightScene()
    {
        LoadScene(GameState.EtherRange);
    }

    public void GoToRanch()
    {
        LoadScene(GameState.DaytimeRanch);
    }

    public void GoToSaloon()
    {
        LoadScene(GameState.Saloon);
    }

    public void GoToEtherRange()
    {
        LoadScene(GameState.EtherRange);
    }

    public void GoToMainMenu()
    {
        LoadScene(GameState.MainMenu);
    }
}
