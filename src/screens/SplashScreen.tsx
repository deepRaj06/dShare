import {View, Image} from 'react-native';
import React, {useEffect} from 'react';
import {navigate} from '../utils/NavigationUtil';
import {commonStyles} from '../styles/commonStyles';

const SplashScreen = () => {
  const navigateToHome = () => {
    navigate('HomeScreen');
  };
  useEffect(() => {
    const timeoutId = setTimeout(navigateToHome, 1200);
    return () => clearTimeout(timeoutId);
  }, []);
  return (
    <View style={commonStyles.container}>
      <Image
        style={commonStyles.img}
        source={require('../assets/images/logo_text.png')}
      />
    </View>
  );
};

export default SplashScreen;
