using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SoundManager : MonoBehaviour
{
    // Audio sources
    [SerializeField] private AudioSource musicSource;
    [SerializeField] private AudioSource sfxSource;
    
    // Audio clips
    [SerializeField] private AudioClip buttonClickSound;
    [SerializeField] private AudioClip sliderSound;
    [SerializeField] private AudioClip positiveFeedbackSound;
    [SerializeField] private AudioClip negativeFeedbackSound;
    [SerializeField] private AudioClip winSound;
    [SerializeField] private AudioClip loseSound;
    [SerializeField] private AudioClip coinsSound;
    
    // Music clips
    [SerializeField] private AudioClip dayMusicClip;
    [SerializeField] private AudioClip nightMusicClip;
    [SerializeField] private AudioClip saloonMusicClip;
    [SerializeField] private AudioClip menuMusicClip;

    private void Awake()
    {
        // Initialize audio sources if not set
        if (musicSource == null)
        {
            GameObject musicObj = new GameObject("MusicSource");
            musicObj.transform.SetParent(transform);
            musicSource = musicObj.AddComponent<AudioSource>();
            musicSource.loop = true;
            musicSource.volume = 0.5f;
        }
        
        if (sfxSource == null)
        {
            GameObject sfxObj = new GameObject("SFXSource");
            sfxObj.transform.SetParent(transform);
            sfxSource = sfxObj.AddComponent<AudioSource>();
            sfxSource.loop = false;
            sfxSource.volume = 0.8f;
        }
        
        // Set default sound clips (in a real project, we'd load these from resources)
        // These are just placeholders for the mock implementation
        if (buttonClickSound == null)
            buttonClickSound = new AudioClip();
        if (sliderSound == null)
            sliderSound = new AudioClip();
        if (positiveFeedbackSound == null)
            positiveFeedbackSound = new AudioClip();
        if (negativeFeedbackSound == null)
            negativeFeedbackSound = new AudioClip();
        if (winSound == null)
            winSound = new AudioClip();
        if (loseSound == null)
            loseSound = new AudioClip();
        if (coinsSound == null)
            coinsSound = new AudioClip();
            
        if (dayMusicClip == null)
            dayMusicClip = new AudioClip();
        if (nightMusicClip == null)
            nightMusicClip = new AudioClip();
        if (saloonMusicClip == null)
            saloonMusicClip = new AudioClip();
        if (menuMusicClip == null)
            menuMusicClip = new AudioClip();
    }

    public void PlayMusic(GameManager.GameState gameState)
    {
        AudioClip clipToPlay = null;
        
        switch (gameState)
        {
            case GameManager.GameState.MainMenu:
                clipToPlay = menuMusicClip;
                break;
            case GameManager.GameState.DaytimeRanch:
                clipToPlay = dayMusicClip;
                break;
            case GameManager.GameState.Saloon:
                clipToPlay = saloonMusicClip;
                break;
            case GameManager.GameState.EtherRange:
                clipToPlay = nightMusicClip;
                break;
        }
        
        // Only change music if it's different from current
        if (clipToPlay != null && musicSource.clip != clipToPlay)
        {
            musicSource.Stop();
            musicSource.clip = clipToPlay;
            musicSource.Play();
        }
    }

    public void PlayButtonClick()
    {
        PlaySound(buttonClickSound);
    }

    public void PlaySliderSound()
    {
        PlaySound(sliderSound);
    }

    public void PlayPositiveFeedback()
    {
        PlaySound(positiveFeedbackSound);
    }

    public void PlayNegativeFeedback()
    {
        PlaySound(negativeFeedbackSound);
    }

    public void PlayWinSound()
    {
        PlaySound(winSound);
    }

    public void PlayLoseSound()
    {
        PlaySound(loseSound);
    }

    public void PlayCoinsSound()
    {
        PlaySound(coinsSound);
    }

    private void PlaySound(AudioClip clip)
    {
        if (clip != null && sfxSource != null)
        {
            sfxSource.PlayOneShot(clip);
        }
    }

    public void SetMusicVolume(float volume)
    {
        if (musicSource != null)
        {
            musicSource.volume = Mathf.Clamp01(volume);
        }
    }

    public void SetSFXVolume(float volume)
    {
        if (sfxSource != null)
        {
            sfxSource.volume = Mathf.Clamp01(volume);
        }
    }

    public void MuteMusic(bool mute)
    {
        if (musicSource != null)
        {
            musicSource.mute = mute;
        }
    }

    public void MuteSFX(bool mute)
    {
        if (sfxSource != null)
        {
            sfxSource.mute = mute;
        }
    }
}
