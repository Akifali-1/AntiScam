declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { ImageProps } from 'react-native';

  interface IconProps extends ImageProps {
    name?: string;
    size?: number;
    color?: string;
    style?: any;
  }

  export default class Ionicons extends Component<IconProps> {}
}
