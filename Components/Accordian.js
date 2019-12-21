import React, { Component, Dimensions } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { Colors } from './Colors';
import Icon from "react-native-vector-icons/MaterialIcons";

export default class Accordian extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        }
    }

    render() {

        return (
            <View>
                <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand()}>
                    <Text style={[styles.title, styles.font]}>{this.props.title}</Text>
                    <Icon name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={Colors.DARKGRAY} />
                </TouchableOpacity>
                <View style={styles.parentHr} />
                {
                    this.state.expanded &&
                    <View style={styles.child}>
                        <Text>{this.props.text_data}</Text>
                        {this.props.visual_data !== null &&
                            <Image
                                style={_styles.preview}
                                source={{
                                    uri:
                                        this.props.visual_data,
                                }}

                            />
                        }
                    </View>
                }

            </View>
        )
    }

    toggleExpand = () => {
        this.setState({ expanded: !this.state.expanded })
    }

}

const _styles = StyleSheet.create({
    //make the camera component absolutely positioned and make it take up the full height and width of the device screen.
    preview: {
        height: 100,
        width: 100,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    }
});

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.DARKGRAY,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 56,
        paddingLeft: 25,
        paddingRight: 18,
        alignItems: 'center',
        backgroundColor: Colors.CGRAY,
    },
    parentHr: {
        height: 1,
        color: Colors.WHITE,
        width: '100%'
    },
    child: {
        backgroundColor: Colors.LIGHTGRAY,
        padding: 16,
    }

});
