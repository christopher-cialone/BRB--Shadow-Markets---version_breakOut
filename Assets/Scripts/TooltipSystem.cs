using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class TooltipSystem : MonoBehaviour
{
    [SerializeField] private GameObject tooltipPrefab;
    [SerializeField] private RectTransform canvasRectTransform;
    
    private static TooltipSystem current;
    private GameObject tooltipInstance;
    private TextMeshProUGUI tooltipText;
    private RectTransform tooltipRectTransform;
    
    // Educational tooltips for different game aspects
    private Dictionary<string, string> educationalTips = new Dictionary<string, string>
    {
        { "ranch_breeding", "Budgeting: Balance Hay/Water for sustainable growth!" },
        { "ranch_upgrade", "Investment: Upgrading increases capacity for future growth!" },
        { "saloon_poker", "Risk Management: Know your odds (50%) and accept potential loss!" },
        { "ether_crafting", "Production: Resources converted to goods add value!" },
        { "ether_market", "Supply/Demand: Market prices fluctuate based on perceived value!" }
    };

    private void Awake()
    {
        // Singleton pattern
        if (current != null && current != this)
        {
            Destroy(gameObject);
            return;
        }
        
        current = this;
        DontDestroyOnLoad(gameObject);
        
        // Create canvas if not provided
        if (canvasRectTransform == null)
        {
            Canvas canvas = FindObjectOfType<Canvas>();
            if (canvas != null)
            {
                canvasRectTransform = canvas.GetComponent<RectTransform>();
            }
        }
        
        // Create tooltip prefab if not provided
        if (tooltipPrefab == null)
        {
            CreateTooltipPrefab();
        }
    }

    private void CreateTooltipPrefab()
    {
        // Create tooltip game object
        tooltipPrefab = new GameObject("Tooltip");
        
        // Add components
        RectTransform rectTransform = tooltipPrefab.AddComponent<RectTransform>();
        Image background = tooltipPrefab.AddComponent<Image>();
        background.color = new Color(0.1f, 0.1f, 0.1f, 0.8f);
        
        // Create text game object
        GameObject textObject = new GameObject("Text");
        textObject.transform.SetParent(tooltipPrefab.transform);
        
        // Add text component
        TextMeshProUGUI text = textObject.AddComponent<TextMeshProUGUI>();
        text.font = Resources.Load<TMP_FontAsset>("Fonts/LiberationSans SDF");
        text.fontSize = 14;
        text.color = Color.white;
        text.alignment = TextAlignmentOptions.Center;
        
        // Setup text rect transform
        RectTransform textRectTransform = textObject.GetComponent<RectTransform>();
        textRectTransform.anchorMin = Vector2.zero;
        textRectTransform.anchorMax = Vector2.one;
        textRectTransform.sizeDelta = new Vector2(-16, -16); // 8 pixel padding
        textRectTransform.anchoredPosition = Vector2.zero;
        
        // Store prefab in Resources folder (not actually happening, just conceptual)
        tooltipPrefab.SetActive(false);
    }

    public static void Show(string tipType, Vector2 position)
    {
        if (current != null && current.educationalTips.TryGetValue(tipType, out string tipText))
        {
            current.ShowTooltip(tipText, position);
        }
    }

    public static void Hide()
    {
        if (current != null)
        {
            current.HideTooltip();
        }
    }

    private void ShowTooltip(string text, Vector2 position)
    {
        // Create tooltip instance if it doesn't exist
        if (tooltipInstance == null)
        {
            tooltipInstance = Instantiate(tooltipPrefab, canvasRectTransform);
            tooltipInstance.SetActive(true);
            
            tooltipRectTransform = tooltipInstance.GetComponent<RectTransform>();
            tooltipText = tooltipInstance.GetComponentInChildren<TextMeshProUGUI>();
        }
        
        // Set text
        tooltipText.text = text;
        
        // Adjust size to fit text
        tooltipRectTransform.sizeDelta = new Vector2(200, 50); // Base size
        
        // Position tooltip
        tooltipRectTransform.position = position;
        
        // Ensure tooltip stays within screen bounds
        AdjustTooltipPosition();
    }

    private void AdjustTooltipPosition()
    {
        if (tooltipRectTransform != null && canvasRectTransform != null)
        {
            Vector2 position = tooltipRectTransform.position;
            Vector2 size = tooltipRectTransform.sizeDelta;
            
            // Get canvas boundaries
            Vector2 canvasSize = canvasRectTransform.sizeDelta;
            
            // Adjust horizontal position
            if (position.x + size.x/2 > canvasSize.x)
            {
                position.x = canvasSize.x - size.x/2;
            }
            else if (position.x - size.x/2 < 0)
            {
                position.x = size.x/2;
            }
            
            // Adjust vertical position
            if (position.y + size.y/2 > canvasSize.y)
            {
                position.y = canvasSize.y - size.y/2;
            }
            else if (position.y - size.y/2 < 0)
            {
                position.y = size.y/2;
            }
            
            tooltipRectTransform.position = position;
        }
    }

    private void HideTooltip()
    {
        if (tooltipInstance != null)
        {
            tooltipInstance.SetActive(false);
        }
    }

    // Add tooltip triggers to UI elements
    public static void AddTooltipTrigger(Button button, string tipType)
    {
        // Create tooltip trigger component
        TooltipTrigger trigger = button.gameObject.AddComponent<TooltipTrigger>();
        trigger.tooltipType = tipType;
    }

    // Component to trigger tooltips on UI elements
    private class TooltipTrigger : MonoBehaviour, UnityEngine.EventSystems.IPointerEnterHandler, UnityEngine.EventSystems.IPointerExitHandler
    {
        public string tooltipType;
        
        public void OnPointerEnter(UnityEngine.EventSystems.PointerEventData eventData)
        {
            TooltipSystem.Show(tooltipType, transform.position);
        }
        
        public void OnPointerExit(UnityEngine.EventSystems.PointerEventData eventData)
        {
            TooltipSystem.Hide();
        }
    }
}
