using UnityEditor;
using System.IO;
using UnityEngine;

public class WebGLBuilder
{
    [MenuItem("Build/WebGL")]
    public static void Build()
    {
        // Define build path
        string buildPath = "WebGLBuild";
        
        // Create directory if it doesn't exist
        if (!Directory.Exists(buildPath))
        {
            Directory.CreateDirectory(buildPath);
        }
        
        // Get all scenes from build settings
        string[] scenes = new string[EditorBuildSettings.scenes.Length];
        for (int i = 0; i < EditorBuildSettings.scenes.Length; i++)
        {
            scenes[i] = EditorBuildSettings.scenes[i].path;
        }
        
        // If no scenes are in build settings, add current scene
        if (scenes.Length == 0 && !string.IsNullOrEmpty(EditorApplication.currentScene))
        {
            scenes = new string[] { EditorApplication.currentScene };
        }
        
        // Define build options
        BuildOptions options = BuildOptions.None;
        
        // Log build start
        Debug.Log("Starting WebGL build...");
        
        // Build the project
        BuildPipeline.BuildPlayer(scenes, buildPath, BuildTarget.WebGL, options);
        
        // Log build completion
        Debug.Log("WebGL build completed at: " + Path.GetFullPath(buildPath));
    }
}