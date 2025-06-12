import Map, { Marker, NavigationControl } from 'react-map-gl';
import { gql, useMutation, useSubscription } from '@apollo/client';
import 'mapbox-gl/dist/mapbox-gl.css';

import { ORDERS_FRAGMENT } from '../../fragments';
import { cookedOrders } from '../../types/cookedOrders';
import { takeOrder, takeOrderVariables } from '../../types/takeOrder';

export const COOKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrders {
    cookedOrders {
      ...OrdersParts
    }
  }
  ${ORDERS_FRAGMENT}
`;

const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!) {
    takeOrder(input: $input) {
      ok
      error
    }
  }
`;

const Dashboard = () => {
  const mapboxToken = 'sk.eyJ1IjoiYWxla3NhbmRyYW5kYW8iLCJhIjoiY21ic282ejBwMDRmdzJrcG5vMzN0ajlkdCJ9.Lkq2jpwrDWXCLDCGWMj_kw';
  const { data: cookedOrdersData } = useSubscription<cookedOrders>(
    COOKED_ORDERS_SUBSCRIPTION
  );
  const [takeOrderMutation] = useMutation<takeOrder, takeOrderVariables>(
    TAKE_ORDER_MUTATION
  );

  const onClickAccept = () => {
    if (cookedOrdersData?.cookedOrders?.id) {
      takeOrderMutation({
        variables: {
          input: {
            id: cookedOrdersData.cookedOrders.id,
          },
        },
      });
    }
  };

  const order = cookedOrdersData?.cookedOrders;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Novo pedido disponível</h1>
      {order ? (
        <>
          <div className="mb-4">
            <p><strong>Pedido ID:</strong> {order.id}</p>
            <p><strong>Restaurante:</strong> {order.restaurant?.name}</p>
            <button
              onClick={onClickAccept}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Aceitar pedido
            </button>
          </div>

          <div style={{ height: '50vh', width: '100%' }}>
            {mapboxToken && order.restaurant?.lat && order.restaurant?.lng && (
              <Map
                mapboxAccessToken={mapboxToken}
                initialViewState={{
                  longitude: order.restaurant.lng,
                  latitude: order.restaurant.lat,
                  zoom: 14,
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-left" />
                <Marker
                  longitude={order.restaurant.lng}
                  latitude={order.restaurant.lat}
                />
              </Map>
            )}
          </div>
        </>
      ) : (
        <p>Nenhum pedido pronto no momento.</p>
      )}
    </div>
  );
};

export default Dashboard;
