import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-root-toast';
import CodePush from 'react-native-code-push';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';

class RNRowlingWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      receivedBytes: 0,
      totalBytes: 0,
    };
  }

  rowlingUpdate = async () => {
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 2,
        },
      },
      status => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({visible: true});
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({visible: false});
            break;
        }
      },
      ({receivedBytes, totalBytes}) => {
        this.setState({
          receivedBytes: (receivedBytes / 1024).toFixed(2),
          totalBytes: (totalBytes / 1024).toFixed(2),
        });
      },
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.rowlingUpdate();
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.visible ? (
          <TouchableOpacity
            style={styles.welcome}
            onPress={() => {
              if (this.state.receivedBytes < 100) {
                this.rowlingUpdate();
              }
            }}>
            <Text style={{fontSize: 15, color: 'black'}}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast visible={this.state.visible} position={Dimensions.get('window').height / 2 - 20} shadow={false} animation={true} hideOnPress={false} opacity={0.7}>
          下载中: {Math.round((this.state.receivedBytes / this.state.totalBytes) * 100 * 100) / 100 || 0}%
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 26,
    width: 52,
    height: 210,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default RNRowlingWizard;
