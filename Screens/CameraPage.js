import { StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import CameraToolBar from '../Components/CameraToolBar'
import { REACT_APP_OCR_API_KEY } from 'react-native-dotenv'
import { REACT_APP_OCR_API_URL } from 'react-native-dotenv'
import * as ImageManipulator from 'expo-image-manipulator';

export default class CameraPage extends React.Component {
    camera = null;

    state = {
        hasCameraPermission: null,
        image: null,
        status: "capturing"
    };

    setStatus = (newStatus) => this.setState({ status: newStatus });

    handleScanIngredients = async () => {
        try {
            let postBody = new FormData();
            postBody.append("base64Image", "data:image/jpeg;base64,"+this.state.image.base64);
            let response = await fetch(REACT_APP_OCR_API_URL, {
                method: 'POST',
                headers: {
                    'apikey': REACT_APP_OCR_API_KEY,
                },
                body: postBody
            });
            let responseJson = await response.json();
            console.log(responseJson);

        }
        catch (error) {
            console.error(error);
        }
        //this.props.toIngredientsPage([{'rice':'fob'}]);
    }

    handleImageCapture = async () => {
        const photoData = await this.camera.takePictureAsync({ quality: 1, });
        const photoData2 = await ImageManipulator.manipulateAsync(photoData.uri, [{ rotate: 0 }], { compress: 0.0, base64: true, format: ImageManipulator.SaveFormat.JPEG });

        this.setState({ image: photoData2 });
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