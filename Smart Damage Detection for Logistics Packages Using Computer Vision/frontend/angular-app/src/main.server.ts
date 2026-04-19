import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
// Import the correct exported member from './app/app'
// Update the import path to match the actual location of AppComponent
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, config, context);

export default bootstrap;
