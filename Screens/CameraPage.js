import { StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import CameraToolBar from '../Components/CameraToolBar'
import * as ImageManipulator from 'expo-image-manipulator';
import { ScreenOrientation } from 'expo';



export default class CameraPage extends React.Component {
    camera = null;

    state = {
        hasCameraPermission: null,
        image: null,
        status: "capturing"
    };

    setStatus = async (new_status) => this.setState({ status: new_status });

    handleScanButton = async () => {
        //add loading screen

        let photo_data = this.state.image;
        for (let i = 0; i < 1; i++) {
            photo_data = await ImageManipulator.manipulateAsync(photo_data.uri, [{ resize: { width: 500 } }], { compress: 0.0, base64: true, format: ImageManipulator.SaveFormat.JPEG });
            this.setState({ image: photo_data });
            await this.setStatus("captured");
        }
        this.props.toIngredientsPage(photo_data);
    }

    handleImageCapture = async () => {

        let photo_data = await this.camera.takePictureAsync({ quality: 0.0, });
        this.setState({ image: photo_data });
        await this.setStatus("captured");
    };

    handleRetake = async () => {
        await this.setStatus("capturing");
    }


    async componentDidMount() {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const hasCameraPermission = (camera.status === 'granted');
        this.setState({ hasCameraPermission: hasCameraPermission });
    };

    render() {
        const hasCameraPermission = this.state.hasCameraPermission;

        if (hasCameraPermission === null || hasCameraPermission === false) {
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
                    onScanIngredients={this.handleScanButton}
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