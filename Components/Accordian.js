import React, { Component, Dimensions, Fragment } from 'react';
import { Linking, View, TouchableOpacity, Text, StyleSheet, Image, Button } from "react-native";
import { Colors } from './Colors';
import Icon from "react-native-vector-icons/MaterialIcons";

export default class Accordian extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            collapse_all: this.props.collapse_all,
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.collapse_all!==this.props.collapse_all){
          this.setState({expanded : false});
          this.setState({collapse_all:nextProps.collapse_all});
        }
    }



    render() {
        return (
            <View>
                <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand()}>
                    <Text style={[styles.title, styles.font]}>{this.props.title}</Text>
                    <Icon name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={Colors.DARKGRAY} />
                </TouchableOpacity>

                {this.state.expanded &&
                    <View style={styles.child}>
                        <Text>{this.props.text_data}</Text>
                        <Fragment> 
                            {this.props.visual_data !== null &&
                                <Image
                                    style={styles.visual_data}
                                    source={{ uri: this.props.visual_data }}
                                />
                            }
                        </Fragment>
                        <Text  style={{fontSize: 15, color:"blue"}} title="Details" onPress={()=> Linking.openURL(this.props.page_url)}>See Details</Text> 
                    </View>
                }
            </View>
        )
    }

    toggleExpand = () => {
        this.setState({ expanded: !this.state.expanded })
    }

}

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.DARKGRAY,
    },
    row: {
        marginTop:'1.5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 56,
        paddingLeft: 25,
        paddingRight: 18,
        alignItems: 'center',
        backgroundColor: '#FFFACD',
    },
    parentHr: {
        height: 1,
        color: Colors.WHITE,
        width: '100%'
    },
    child: {
        backgroundColor: Colors.LIGHTGRAY,
        padding: 16,
    },
    visual_data: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 200,
        width: 200,
    }

});
