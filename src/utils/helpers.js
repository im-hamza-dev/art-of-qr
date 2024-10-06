export const generateFileName = (text) => {
  let textArr = text?.split(" ");
  console.log(textArr);
  let words = textArr.length > 1 ? `${textArr[0]}${textArr[1]}` : textArr[0];
  let name = `ArtofQr_${words}`;
  return name;
};
