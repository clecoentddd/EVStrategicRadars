// pages/strategies/[streamid].js
import StrategyStream from './StrategyStream';

// This will automatically handle the dynamic routing
export default StrategyStream;

// Optional: If you need server-side props
export async function getServerSideProps(context) {
  // You can add server-side data fetching here if needed
  return {
    props: {}, // will be passed to the page component
  };
}