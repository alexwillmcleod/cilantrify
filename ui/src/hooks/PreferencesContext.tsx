import {
  createContext,
  useContext,
  createSignal,
  Accessor,
  onMount,
} from 'solid-js';
import Cookies from 'js-cookie';

const PreferencesContext = createContext<{
  measurementSystem: Accessor<'metric' | 'imperial'>;
  setMeasurementSystem: (newSystem: 'metric' | 'imperial') => void;
}>();

export const PreferencesProvider = (props: any) => {
  const [measurementSystem, setMeasurementSystem] = createSignal<
    'metric' | 'imperial'
  >('metric');

  onMount(() => {
    getMeasurementSystem();
  });
  const getMeasurementSystem = async () => {
    const newMeasurementSystem = Cookies.get('measurement-system');
    if (!newMeasurementSystem) return;
    if (newMeasurementSystem != 'metric' && newMeasurementSystem != 'imperial')
      return;
    setMeasurementSystem(newMeasurementSystem as 'metric' | 'imperial');
  };

  const handleNewMeasurementSystem = (
    newMeasurementSystem: 'metric' | 'imperial'
  ) => {
    if (newMeasurementSystem != 'metric' && newMeasurementSystem != 'imperial')
      return;
    Cookies.set('measurement-system', newMeasurementSystem);
    setMeasurementSystem(newMeasurementSystem);
  };

  return (
    <PreferencesContext.Provider
      value={{
        measurementSystem,
        setMeasurementSystem: handleNewMeasurementSystem,
      }}
    >
      {props.children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
