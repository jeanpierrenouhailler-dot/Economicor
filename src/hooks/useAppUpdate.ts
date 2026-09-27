import { useState, useEffect } from 'react';
import { updateService, UpdateInfo } from '../services/UpdateService';

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => updateService.getState());

  useEffect(() => {
    const unsubscribe = updateService.subscribe((info) => {
      setUpdateInfo(info);
    });
    return unsubscribe;
  }, []);

  const checkForUpdates = () => updateService.checkForUpdates(true);
  const forceUpdate = () => updateService.forceUpdate();
  const setAutoUpdate = (enabled: boolean) => updateService.setAutoUpdate(enabled);

  return {
    ...updateInfo,
    checkForUpdates,
    forceUpdate,
    setAutoUpdate
  };
}
