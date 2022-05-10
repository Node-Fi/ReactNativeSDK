import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncWriteString = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

export const asyncClear = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(e);
  }
};

export const asyncWriteObject = async (
  key: string,
  value: { [field: string]: any }
) => {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (e) {
    console.error(e);
  }
};

export const asyncReadString = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const asyncReadObject = async <T>(key: string): Promise<T | null> => {
  const jsonString = await asyncReadString(key);
  return jsonString ? JSON.parse(jsonString) : null;
};
