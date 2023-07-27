import { createSignal } from 'solid-js';
import EnterEmail from './EnterEmail';
import Navbar from '../../components/Navbar';
import EmailSuccess from './EmailSentSuccess';
import EnterName from './EnterName';

export default function EmailSignIn() {
  const [email, setEmail] = createSignal<string>('');
  const [step, setStep] = createSignal<number>(0);
  const [isNew, setIsNew] = createSignal<boolean>(false);
  const [code, setCode] = createSignal<string>('');
  const [givenName, setGivenName] = createSignal<string>('');
  const [familyName, setFamilyName] = createSignal<string>('');

  const handleNextStep = () => {
    if (step() >= 1) return;
    setStep(step() + 1);
  };

  // const handlePreviousStep = () => {
  //   if (step() != 0) return;
  //   setStep(step() - 1);
  // };

  const handleGoToName = () => {
    setStep(1);
  };

  const handleGoToSend = () => {
    setStep(2);
  };

  const handleMispelledEmail = () => {
    setStep(0);
  };

  const steps = [
    <EnterEmail
      email={email}
      setEmail={setEmail}
      goToName={handleGoToName}
      goToSend={handleGoToSend}
      setIsNew={setIsNew}
    />,
    <EnterName
      code={code}
      email={email}
      givenName={givenName}
      setGivenName={setGivenName}
      familyName={familyName}
      setFamilyName={setFamilyName}
      goToSend={handleGoToSend}
    />,
    <EmailSuccess
      email={email}
      code={code}
      setCode={setCode}
      onPrevious={handleMispelledEmail}
      onNext={handleNextStep}
      isNew={isNew}
      familyName={familyName}
      givenName={givenName}
    />,
  ];

  return (
    <div>
      <Navbar
        isSearchBarVisible={false}
        isShouldRedirect={false}
      />
      {steps[step()]}
    </div>
  );
}
