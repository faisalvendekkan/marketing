import { AIGenerator } from './AIGenerator';
export default function AIVideo() {
  return <AIGenerator title="AI Video Studio" subtitle="Scripts, storyboards and voiceovers for short-form video"
    defaultFeature="reels_script"
    presets={[
      { value: 'reels_script', label: 'Reels / Shorts Script', placeholder: 'A 30-second reel introducing our new coffee blend with a strong hook…' },
      { value: 'video_script', label: 'Video Script', placeholder: 'A 2-minute explainer video about our SaaS onboarding…' },
      { value: 'ad_copy', label: 'Voiceover Script', placeholder: 'A warm, energetic voiceover for a travel agency promo…' },
      { value: 'seo_faqs', label: 'Storyboard Scenes', placeholder: 'Scene-by-scene storyboard for a product unboxing video…' },
    ]} />;
}
