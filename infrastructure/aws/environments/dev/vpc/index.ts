import { App } from 'cdktf';
import { DevVpcStack } from './main';

const app = new App();
new DevVpcStack(app, 'dev-vpc');
app.synth();
