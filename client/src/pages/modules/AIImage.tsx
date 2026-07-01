import { AIGenerator } from './AIGenerator';
export default function AIImage() {
  return <AIGenerator title="AI Image Studio" subtitle="Generate image prompts and creative briefs for any channel"
    defaultFeature="ad_copy"
    presets={[
      { value: 'ad_copy', label: 'Image Prompt Generator', placeholder: 'A vibrant flat-lay of summer skincare products on a pastel background…' },
      { value: 'product_description', label: 'Poster / Flyer Brief', placeholder: 'A festive Diwali sale poster with 50% off, gold and maroon theme…' },
      { value: 'headline', label: 'Ad Creative Headlines', placeholder: 'Headlines for a fitness app launch targeting young professionals…' },
      { value: 'taglines', label: 'Thumbnail Text Ideas', placeholder: 'YouTube thumbnail text for a productivity tips video…' },
    ]} />;
}
