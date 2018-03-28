import '@babel/polyfill';
import { configure } from '@storybook/react';
import { setDefaults } from '@storybook/addon-info';
import TableComponent from './TableComponent';
import Code from './Code';
import stories from '../stories';

setDefaults({
  inline: true,
  maxPropsIntoLine: 1,
  'TableComponent': TableComponent,
  components: {
    code: Code,
  },
});

configure(() => stories, module);