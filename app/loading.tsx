export default function Loading(){
 return <main className="nexora-route-loading" aria-label="Loading Nexora" aria-busy="true">
  <div className="nexora-skeleton nexora-route-loading-hero"/>
  <div className="nexora-skeleton nexora-route-loading-heading"/>
  <div className="nexora-route-loading-grid">{Array.from({length:4},(_,index)=><div className="nexora-skeleton nexora-route-loading-card" key={index}/>)}</div>
 </main>;
}