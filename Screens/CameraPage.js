import { StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import CameraToolBar from '../Components/CameraToolBar'

export default class CameraPage extends React.Component {
    camera = null;

    state = {
        hasCameraPermission: null,
        image: null,
        status: "capturing"
    };

    setStatus = (newStatus) => this.setState({ status: newStatus });

    handleScanIngredients = async() => {
        this.props.toIngredientsPage([{'rice':'fob'}]);
    }

    handleImageCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ image: photoData });
        this.setStatus("captured");
    };

    handleRetake = () => {
        this.setStatus("capturing");
    }


    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const hasCameraPermission = (camera.status === 'granted');

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
            // using a react fragment to render multiple elements without a wrapper component
            <React.Fragment>
                {this.state.status == "captured" &&
                    <View>
                        <Image style={styles.preview}
                            source={{ uri: this.state.image.uri }} />
                    </View>
                }
                {this.state.status == "capturing" &&
                    <View>
                        <Camera
                            style={styles.preview}
                            ref={camera => this.camera = camera}
                        />
                    </View>
                }
                <CameraToolBar
                    onImageCapture={this.handleImageCapture}
                    status={this.state.status}
                    onRetake={this.handleRetake}
                    onScanIngredients={this.handleScanIngredients}
                />

            </React.Fragment>

        );
    };
};

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const styles = StyleSheet.create({
    //make the camera component absolutely positioned and make it take up the full height and width of the device screen.
    preview: {
        height: winHeight,
        width: winWidth,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    }
});