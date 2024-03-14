/* eslint-disable jsx-a11y/alt-text */
import { useQRCode } from 'next-qrcode';

export default function QRCode({ url }) {
  const { Image } = useQRCode();

  return (
    <Image
      text={url.trim()}
      options={{
        type: 'image/jpeg',
        quality: 1,
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: '#000',
          light: '#FFFFFF',
        },
      }}
    />
  );
};
