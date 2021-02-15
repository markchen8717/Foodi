import React, { useState, useEffect, Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from "@react-native-community/netinfo";


const NetworkBanner = props => {
    const [state, setState] = useState({});
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state_ => {
            if((!state || state_.isConnected !== state.isConnected) && props.callback !== undefined){
                props.callback();
            }
            setState(state_);
        });
        return () => {
            unsubscribe();
        }
    }, []);
    return (
        <Fragment>
            {
                state!={} && !state.isConnected &&
                <View style={style.parent}>
                    <Text style={style.text}>No Internet Connection</Text>
                </View>
            }
        </Fragment>
    );
};

const style = StyleSheet.create({
    parent: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    text: {
        color: 'red',
        fontSize: 25
    }

});

export default NetworkBanner;