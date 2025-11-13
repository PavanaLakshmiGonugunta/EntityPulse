import "./styling/NewsElement.css";

function NewsElement({ headline, source, url, sentiment }) {
  return (
    <div className={`news-element-div ${sentiment.toLowerCase()}-text`}>
      {/* Optional clickable headline */}
      {/* <a href={url} target="_blank" rel="noopener noreferrer">{headline}</a> */}
      <p>{headline}</p>
      <p>2 hours ago · {source}</p>
      <div className={`news-element-sentiment-div ${sentiment.toLowerCase()}-div`}>
        {sentiment}
      </div>
    </div>
  );
}

export default NewsElement;
