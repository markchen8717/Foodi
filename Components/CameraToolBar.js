import React from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';
import { Camera } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { Col, Row, Grid } from "react-native-easy-grid";
import { View, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';


export default function CameraToolBar(props) {
    return (
        <Grid style={styles.bottomToolbar}>
            <Row>
                <Col style={styles.alignCenter}>
                    {props.status == "captured" &&
                        < TouchableWithoutFeedback
                            onPress={props.onScanIngredients}>
                            <Text>
                                Scan
                            </Text>
                        </TouchableWithoutFeedback>
                    }
                </Col>
                <Col size={2} style={styles.alignCenter}>
                    {props.status == "capturing" &&
                        < TouchableWithoutFeedback
                            onPress={props.onImageCapture}>
                            <View style={styles.captureBtn} />
                        </TouchableWithoutFeedback>
                    }
                    {props.status == "captured" &&
                        < TouchableWithoutFeedback
                            onPress={props.onRetake}>
                            <Text>
                                Retake
                            </Text>
                        </TouchableWithoutFeedback>
                    }
                </Col>
                <Col/>
            </Row>
        </Grid >
    );
}

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const styles = StyleSheet.create({
    //makes our entire toolbar full width of our device screen and positions it at the bottom of the screen
    bottomToolbar: {
        width: winWidth,
        position: 'absolute',
        height: 100,
        bottom: 0,
    },
    //is a circular button with white border by default
    captureBtn: {
        width: 60,
        height: 60,
        borderWidth: 2,
        borderRadius: 60,
        borderColor: "#FFFFFF",
    },
    // makes the button a bit larger in size when the user taps on the button and by making it bigger, 
    // we can make sure that the entire button isn't covered by user's finger
    captureBtnActive: {
        width: 80,
        height: 80,
    },
    captureBtnInternal: {
        width: 76,
        height: 76,
        borderWidth: 2,
        borderRadius: 76,
        backgroundColor: "red",
        borderColor: "transparent",
    },
    //horizontally and vertically centers all of an element's children.
    alignCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});