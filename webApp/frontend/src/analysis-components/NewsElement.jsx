import './styling/NewsElement.css'

function NewsElement({headline, source, url, sentiment}){
    return (
        <div className={`news-element-div ${sentiment.toLowerCase()}-text`}>
            {/* <a href = {url}>{headline}</a> */}
            <p>{headline}</p>
            <p>2 hours ago . {source}</p>
            <div className={`news-element-sentiment-div ${sentiment.toLowerCase()}-div`}>
                {sentiment}
            </div>
        </div>
    )
}

export default NewsElement;