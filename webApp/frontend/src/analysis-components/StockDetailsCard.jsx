import './styling/StockDetailsCard.css'

export default function StockDetailsCard(
    {title, icon, bodyText, bodyDetail}
){
    return(
        <div class="stock-details-card">
            <div class="stock-detail-title-icon">
                <p>{title}</p>
                <p id="stock-details-icon">{icon}</p>
            </div>
            <h4>${bodyText}</h4>
            <p id="bodyDetail">{bodyDetail}</p>
        </div>
    )
}