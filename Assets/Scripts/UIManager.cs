using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    [SerializeField] private Canvas mainCanvas;
    [SerializeField] private GameObject tooltipPrefab;
    
    private Dictionary<string, GameObject> activeTooltips = new Dictionary<string, GameObject>();

    private void Awake()
    {
        // Create canvas if it doesn't exist
        if (mainCanvas == null)
        {
            GameObject canvasObject = new GameObject("MainCanvas");
            mainCanvas = canvasObject.AddComponent<Canvas>();
            mainCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            
            // Add canvas scaler
            CanvasScaler scaler = canvasObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            
            // Add graphic raycaster
            canvasObject.AddComponent<GraphicRaycaster>();
            
            DontDestroyOnLoad(canvasObject);
        }
    }

    // Show a tooltip with the given message at the specified screen position
    public void ShowTooltip(string id, string message, Vector2 position)
    {
        // Check if tooltip already exists
        if (activeTooltips.ContainsKey(id))
        {
            // Update existing tooltip
            Text tooltipText = activeTooltips[id].GetComponentInChildren<Text>();
            if (tooltipText != null)
            {
                tooltipText.text = message;
            }
            
            // Update position
            RectTransform rectTransform = activeTooltips[id].GetComponent<RectTransform>();
            rectTransform.position = position;
        }
        else
        {
            // Create new tooltip
            GameObject tooltip = Instantiate(tooltipPrefab, mainCanvas.transform);
            
            // Set text
            Text tooltipText = tooltip.GetComponentInChildren<Text>();
            if (tooltipText != null)
            {
                tooltipText.text = message;
            }
            
            // Set position
            RectTransform rectTransform = tooltip.GetComponent<RectTransform>();
            rectTransform.position = position;
            
            // Store reference
            activeTooltips.Add(id, tooltip);
        }
    }

    // Hide a specific tooltip
    public void HideTooltip(string id)
    {
        if (activeTooltips.ContainsKey(id))
        {
            Destroy(activeTooltips[id]);
            activeTooltips.Remove(id);
        }
    }

    // Hide all tooltips
    public void HideAllTooltips()
    {
        foreach (var tooltip in activeTooltips.Values)
        {
            Destroy(tooltip);
        }
        
        activeTooltips.Clear();
    }

    // Handle button hover animation
    public void OnButtonHover(Button button, bool isHovering)
    {
        if (isHovering)
        {
            // Scale up button by 10%
            button.transform.localScale = new Vector3(1.1f, 1.1f, 1.1f);
        }
        else
        {
            // Reset scale
            button.transform.localScale = Vector3.one;
        }
    }

    // Show educational tooltip near a button
    public void ShowEducationalTip(Button button, string message)
    {
        // Get button position
        RectTransform rectTransform = button.GetComponent<RectTransform>();
        Vector2 position = rectTransform.position;
        
        // Offset the position to appear below the button
        position.y -= rectTransform.rect.height;
        
        // Show tooltip
        ShowTooltip("edu_" + button.name, message, position);
    }
}
