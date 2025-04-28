import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {bottomTabStyles} from '../../styles/bottomTabStyle';
import Icon from '../global/Icon';
import {navigate} from '../../utils/NavigationUtil';
import QRScannerModal from '../modals/QRScannerModal';

const AbsoluteQRBottom = () => {
  const [isVisible, setVisible] = useState(false);
  return (
    <>
      <View style={bottomTabStyles.container}>
        <TouchableOpacity onPress={() => navigate('ReceivedFileScreen')}>
          <Icon
            name="apps-sharp"
            iconFamily="Ionicons"
            color="#333"
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setVisible(true)}
        style={bottomTabStyles.qrCode}
            >
          <Icon
            name="qrcode-scan"
            iconFamily="MaterialCommunityIcons"
            color="#fff"
            size={26}
          />
        </TouchableOpacity>
        <TouchableOpacity >
          <Icon
            name="beer-sharp"
            iconFamily="Ionicons"
            color="#333"
            size={24}
          />
        </TouchableOpacity>
      </View>

      {isVisible && <QRScannerModal visible={isVisible} onClose={() => setVisible(false)}/>}
    </>
  );
};

export default AbsoluteQRBottom;
