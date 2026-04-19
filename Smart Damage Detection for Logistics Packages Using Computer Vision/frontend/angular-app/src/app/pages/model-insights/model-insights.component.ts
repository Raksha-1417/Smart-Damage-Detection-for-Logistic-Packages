import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-model-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="insights-page">
      <div class="page-header">
        <h1>Model Insights</h1>
        <p>Performance metrics and explainability visualizations</p>
      </div>

      <div class="metrics-grid">
        <div class="card">
          <p class="metric-label">Overall Accuracy</p>
          <h2 class="metric-value">96.8%</h2>
          <p class="metric-change">+1.2% from last week</p>
        </div>
        <div class="card">
          <p class="metric-label">Avg. Precision</p>
          <h2 class="metric-value">96.4%</h2>
          <p class="metric-change">+0.8% from last week</p>
        </div>
        <div class="card">
          <p class="metric-label">Avg. Recall</p>
          <h2 class="metric-value">96.0%</h2>
          <p class="metric-change">+1.0% from last week</p>
        </div>
      </div>

      <div class="card chart-card">
        <h3>Training Progress</h3>
        <div class="chart-placeholder">
          <p>📈 Training metrics chart</p>
          <p class="chart-note">Accuracy, Precision, and Recall over epochs</p>
        </div>
      </div>

      <div class="card chart-card">
        <h3>Per-Class Performance</h3>
        <div class="chart-placeholder">
          <p>📊 Performance by damage type</p>
          <p class="chart-note">Precision, Recall, and F1-Score comparison</p>
        </div>
      </div>

      <div class="card">
        <h3>Explainability Methods</h3>
        <div class="xai-grid">
          <div class="xai-method">
            <h4>Grad-CAM</h4>
            <p>Gradient-weighted Class Activation Mapping visualizes which regions contributed most to predictions.</p>
            <div class="xai-visual" style="background: linear-gradient(135deg, #fef3c7, #fee2e2);"></div>
          </div>
          <div class="xai-method">
            <h4>SHAP Values</h4>
            <p>SHAP provides unified feature importance by computing pixel contributions to predictions.</p>
            <div class="xai-visual" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .insights-page {
      max-width: 1400px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--gray-600);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-label {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .metric-change {
      color: var(--success);
      font-size: 0.875rem;
    }

    .chart-card {
      margin-bottom: 1.5rem;
    }

    .chart-card h3 {
      margin-bottom: 1.5rem;
    }

    .chart-placeholder {
      height: 300px;
      background: var(--gray-50);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
    }

    .chart-note {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .xai-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .xai-method h4 {
      margin-bottom: 0.5rem;
    }

    .xai-method p {
      font-size: 0.875rem;
      color: var(--gray-600);
      margin-bottom: 1rem;
    }

    .xai-visual {
      aspect-ratio: 16/9;
      border-radius: 8px;
    }
  `]
})
export class ModelInsightsComponent {}
