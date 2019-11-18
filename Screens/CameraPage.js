import { StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

export default class CameraPage extends React.Component {
  camera = null;

  state = {
      hasCameraPermission: null,
  };

  async componentDidMount() {
      const camera = await Permissions.askAsync(Permissions.CAMERA);
      const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

      this.setState({ hasCameraPermission });
  };

  render() {
      const { hasCameraPermission } = this.state;

      if (hasCameraPermission === null) {
          return <View />;
      } else if (hasCameraPermission === false) {
          return <Text>Access to camera has been denied.</Text>;
      }

      return (
          <View>
              <Camera
                  style = {styles.preview}
                  ref={camera => this.camera = camera}
              />
          </View>
      );
  };
};


const { width: winWidth, height: winHeight } = Dimensions.get('window');

const styles =  StyleSheet.create({
    preview: {
        height: winHeight,
        width: winWidth,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
});