import '@babel/polyfill';
import { configure } from '@storybook/react';
import stories from '../stories';

configure(() => stories, module);