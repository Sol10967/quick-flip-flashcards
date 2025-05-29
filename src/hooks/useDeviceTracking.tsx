
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeviceSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  last_active: string;
  user_agent: string;
  ip_address?: string;
}

export const useDeviceTracking = () => {
  const [deviceCount, setDeviceCount] = useState(0);

  // Generate a unique device fingerprint
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('device-fingerprint', 10, 10);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = btoa(
      navigator.userAgent +
      navigator.language +
      screen.width +
      screen.height +
      new Date().getTimezoneOffset() +
      canvasFingerprint
    ).slice(0, 32);
    
    return fingerprint;
  };

  const registerDevice = async (userId: string) => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Check current active devices for this user
      const { data: existingDevices, error: fetchError } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId)
        .gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Active in last 7 days

      if (fetchError) {
        console.error('Error fetching devices:', fetchError);
        return false;
      }

      // Check if current device is already registered
      const currentDevice = existingDevices?.find(device => 
        device.device_fingerprint === deviceFingerprint
      );

      if (currentDevice) {
        // Update last active time for existing device
        const { error: updateError } = await supabase
          .from('user_devices')
          .update({ 
            last_active: new Date().toISOString(),
            user_agent: navigator.userAgent
          })
          .eq('id', currentDevice.id);

        if (updateError) {
          console.error('Error updating device:', updateError);
        }
        
        setDeviceCount(existingDevices.length);
        return true;
      }

      // Check device limit (3 devices max)
      if (existingDevices && existingDevices.length >= 3) {
        toast({
          title: "Device limit reached",
          description: "You can only be logged in on 3 devices at once. Please log out from another device or wait for inactive sessions to expire.",
          variant: "destructive"
        });
        return false;
      }

      // Register new device
      const { error: insertError } = await supabase
        .from('user_devices')
        .insert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          last_active: new Date().toISOString(),
          user_agent: navigator.userAgent
        });

      if (insertError) {
        console.error('Error registering device:', insertError);
        return false;
      }

      setDeviceCount((existingDevices?.length || 0) + 1);
      return true;
    } catch (error) {
      console.error('Device registration error:', error);
      return false;
    }
  };

  const updateDeviceActivity = async (userId: string) => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      const { error } = await supabase
        .from('user_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint);

      if (error) {
        console.error('Error updating device activity:', error);
      }
    } catch (error) {
      console.error('Device activity update error:', error);
    }
  };

  const cleanupInactiveDevices = async (userId: string) => {
    try {
      // Remove devices inactive for more than 7 days
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', userId)
        .lt('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error cleaning up devices:', error);
      }
    } catch (error) {
      console.error('Device cleanup error:', error);
    }
  };

  const logoutDevice = async (userId: string) => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint);

      if (error) {
        console.error('Error logging out device:', error);
      }
    } catch (error) {
      console.error('Device logout error:', error);
    }
  };

  return {
    deviceCount,
    registerDevice,
    updateDeviceActivity,
    cleanupInactiveDevices,
    logoutDevice
  };
};
