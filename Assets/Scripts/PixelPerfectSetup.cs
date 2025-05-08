using UnityEngine;
using UnityEngine.U2D;

// This script sets up the pixel perfect camera for the game
// Attach this to the main camera or a setup manager
public class PixelPerfectSetup : MonoBehaviour
{
    [SerializeField] private Camera mainCamera;
    [SerializeField] private int assetPixelsPerUnit = 16; // 16x16 pixel units
    [SerializeField] private int referenceResolutionWidth = 480;
    [SerializeField] private int referenceResolutionHeight = 270;
    [SerializeField] private bool upscaleRenderTexture = true;
    [SerializeField] private bool pixelSnapping = true;
    [SerializeField] private bool cropFrameX = false;
    [SerializeField] private bool cropFrameY = false;
    [SerializeField] private bool stretchFill = false;

    private void Awake()
    {
        SetupPixelPerfectCamera();
    }

    private void SetupPixelPerfectCamera()
    {
        // Find the main camera if not assigned
        if (mainCamera == null)
        {
            mainCamera = Camera.main;
        }

        // Check if the camera has a PixelPerfectCamera component
        PixelPerfectCamera pixelPerfectCamera = mainCamera.GetComponent<PixelPerfectCamera>();
        
        // If not, add one
        if (pixelPerfectCamera == null)
        {
            pixelPerfectCamera = mainCamera.gameObject.AddComponent<PixelPerfectCamera>();
        }
        
        // Configure the pixel perfect camera settings
        pixelPerfectCamera.assetsPPU = assetPixelsPerUnit;
        pixelPerfectCamera.refResolutionX = referenceResolutionWidth;
        pixelPerfectCamera.refResolutionY = referenceResolutionHeight;
        pixelPerfectCamera.upscaleRT = upscaleRenderTexture;
        pixelPerfectCamera.pixelSnapping = pixelSnapping;
        pixelPerfectCamera.cropFrameX = cropFrameX;
        pixelPerfectCamera.cropFrameY = cropFrameY;
        pixelPerfectCamera.stretchFill = stretchFill;
        
        // Ensure the camera is set to orthographic for 2D
        mainCamera.orthographic = true;
        
        Debug.Log("Pixel Perfect Camera setup complete with settings: " +
                  $"assetsPPU: {assetPixelsPerUnit}, " +
                  $"refResolution: {referenceResolutionWidth}x{referenceResolutionHeight}");
    }
}
