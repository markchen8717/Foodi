import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



const Header = props => {
    return (
        <View style={ [props.style,style.header]}>
            <Text style={style.header_title}>{props.title}</Text>
        </View>
    );
};




const style = StyleSheet.create({
    header:{
        height:"100%",
        width:"100%",
        alignItems:'center',
        justifyContent:'center',
        overflow: 'hidden'
    },
    header_title:{
        color:'black',
        fontWeight : 'bold',
        fontSize: 25
    }

});

export default Header;