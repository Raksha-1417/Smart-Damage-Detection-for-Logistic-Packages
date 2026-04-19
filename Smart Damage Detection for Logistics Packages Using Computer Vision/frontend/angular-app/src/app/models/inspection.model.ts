export interface Inspection {
  id: string;
  imageUrl: string;
  damageType: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  timestamp: Date;
  reviewer?: string;
  overlayType?: 'gradcam' | 'shap' | 'none';
}
