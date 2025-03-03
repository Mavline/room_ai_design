import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

export const CompareSlider = ({
  original,
  restored,
}: {
  original: string;
  restored: string;
}) => {
  return (
    <ReactCompareSlider
      itemOne={<ReactCompareSliderImage src={original} alt="original photo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      itemTwo={<ReactCompareSliderImage src={restored} alt="generated photo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      portrait
      className="flex w-[600px] mt-5 h-96"
    />
  );
};
