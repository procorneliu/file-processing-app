type ErrorMessageProp = {
  message: string;
};

function ErrorMessage({ message }: ErrorMessageProp) {
  return <p className="pt-2 text-sm text-red-500">{message}</p>;
}

export default ErrorMessage;
