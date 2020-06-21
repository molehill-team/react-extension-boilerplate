export const checkStatus = (res) => {
  if (!res.ok) {
    throw res.text;
  }

  return res.json();
};