import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ConfirmationmodalProps = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => {};
    onCancel: () => void;
}

const ConfirmationModal = ({ 
    visible, 
    title, 
    message, 
    onConfirm, 
    onCancel 
}: ConfirmationmodalProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType='slide'
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ConfirmationModal;
