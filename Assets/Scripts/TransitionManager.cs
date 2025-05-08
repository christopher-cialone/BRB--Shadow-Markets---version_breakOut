using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TransitionManager : MonoBehaviour
{
    [SerializeField] private GameObject transitionPanel;
    [SerializeField] private CanvasGroup transitionCanvasGroup;
    [SerializeField] private float transitionDuration = 1f;
    
    private Coroutine currentTransition;

    private void Awake()
    {
        // Create transition panel if it doesn't exist
        if (transitionPanel == null)
        {
            Canvas canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                GameObject canvasObject = new GameObject("TransitionCanvas");
                canvas = canvasObject.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = 9999; // Ensure it's on top
                
                // Add canvas scaler
                CanvasScaler scaler = canvasObject.AddComponent<CanvasScaler>();
                scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                scaler.referenceResolution = new Vector2(1920, 1080);
                
                DontDestroyOnLoad(canvasObject);
            }
            
            // Create panel
            transitionPanel = new GameObject("TransitionPanel");
            transitionPanel.transform.SetParent(canvas.transform, false);
            
            // Add image component (black background)
            Image panelImage = transitionPanel.AddComponent<Image>();
            panelImage.color = Color.black;
            
            // Add canvas group for fading
            transitionCanvasGroup = transitionPanel.AddComponent<CanvasGroup>();
            
            // Set rect transform to cover the entire screen
            RectTransform rectTransform = transitionPanel.GetComponent<RectTransform>();
            rectTransform.anchorMin = Vector2.zero;
            rectTransform.anchorMax = Vector2.one;
            rectTransform.sizeDelta = Vector2.zero;
            
            // Initially transparent
            transitionCanvasGroup.alpha = 0f;
        }
    }

    // Start a transition (fade to black)
    public void StartTransition()
    {
        // Stop any current transition
        if (currentTransition != null)
        {
            StopCoroutine(currentTransition);
        }
        
        // Start new transition
        currentTransition = StartCoroutine(FadeTransition(0f, 1f, transitionDuration));
    }

    // End a transition (fade from black)
    public void EndTransition()
    {
        // Stop any current transition
        if (currentTransition != null)
        {
            StopCoroutine(currentTransition);
        }
        
        // Start new transition
        currentTransition = StartCoroutine(FadeTransition(1f, 0f, transitionDuration));
    }

    // Fade the transition panel from startAlpha to endAlpha over duration seconds
    private IEnumerator FadeTransition(float startAlpha, float endAlpha, float duration)
    {
        transitionCanvasGroup.alpha = startAlpha;
        
        float elapsedTime = 0f;
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float t = Mathf.Clamp01(elapsedTime / duration);
            
            transitionCanvasGroup.alpha = Mathf.Lerp(startAlpha, endAlpha, t);
            
            yield return null;
        }
        
        transitionCanvasGroup.alpha = endAlpha;
        currentTransition = null;
    }

    // Day-night transition effect
    public void TransitionDayNight(bool toNight)
    {
        // Stop any current transition
        if (currentTransition != null)
        {
            StopCoroutine(currentTransition);
        }
        
        // Start new transition - fade to half black for night, or to clear for day
        float targetAlpha = toNight ? 0.5f : 0f;
        currentTransition = StartCoroutine(FadeTransition(transitionCanvasGroup.alpha, targetAlpha, transitionDuration));
    }
}
