// visionCameraOCR.js - отдельный модуль
import { Camera } from 'react-native-vision-camera';
import { useScanOCR, OCRFrame } from 'vision-camera-ocr';

export const useVisionOCR = () => {
  const { frameProcessor } = useScanOCR((frame) => {
    // Обработка распознанного текста
    console.log('Распознанный текст:', frame.result.text);
  });
  
  return { frameProcessor };
};

// В основном компоненте камеры:
const camera = useRef<Camera>(null);
const { frameProcessor } = useVisionOCR();

return (
  <Camera
    ref={camera}
    device={device}
    isActive={true}
    frameProcessor={frameProcessor}
    frameProcessorFps={5}
  />
);