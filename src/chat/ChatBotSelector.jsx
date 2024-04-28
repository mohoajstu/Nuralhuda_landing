import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const window = Dimensions.get('window');

const ChatBotSelector = ({ visible, onSelect, onClose }) => {
  const handleSelect = (option) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.modalContent}>
          <TouchableOpacity style={styles.option} onPress={() => handleSelect('nurAlHuda')}>
          <Image source={require('/Users/mohammedabduljabbar/Downloads/Nuralhuda_landing/public/img/about-nbg.png')} style={styles.icon} />
            <Text style={styles.optionText}>Nur Al Huda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => handleSelect('nurAlHudaForKids')}>
          <Image source={require('/Users/mohammedabduljabbar/Downloads/Nuralhuda_landing/public/img/nuralhudaforkids.png')} style={styles.icon} />
            <Text style={styles.optionText}>Nur Al Huda for Kids</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => handleSelect('islamicSocraticMethod')}>
          <Image source={require('/Users/mohammedabduljabbar/Downloads/Nuralhuda_landing/public/img/islamic_socratic_method.png')} style={styles.icon} />
            <Text style={styles.optionText}>Islamic Socratic Method</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => handleSelect('aiForIslamicResearch')}>
          <Image source={require('/Users/mohammedabduljabbar/Downloads/Nuralhuda_landing/public/img/Nuralhuda-applogo.png')} style={styles.icon} />
            <Text style={styles.optionText}>AI for Islamic Research</Text>
          </TouchableOpacity>
          </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
 
  modalContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFEDA4',
    borderRadius: 5,
    padding: 15,
  },
  closeButton: {
    marginTop: 0, // Adjust the margin as needed
    backgroundColor: '#164F48',
    borderRadius: 5,
    padding: 10,
    // Align the button itself if it does not stretch
    alignSelf: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, // Add vertical margin for spacing between options
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10, // Add some space between the icon and text
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },

});

export default ChatBotSelector;