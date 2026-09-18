import { GameState, CustomerOrder, CustomerReview, MarketEvent } from '../types/game';

const FIRST_NAMES = [
  'Lucas', 'Mariana', 'Gabriel', 'Larissa', 'Bruno', 'Beatriz', 'Felipe', 'Camila',
  'Rodrigo', 'Juliana', 'Matheus', 'Fernanda', 'Thiago', 'Amanda', 'Gustavo', 'Letícia',
  'Enzo', 'Valentina', 'Rafael', 'Natália', 'Diego', 'Carla', 'Vinícius', 'Isabela'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade'
];

const AVATARS = ['🧑‍💼', '👩‍💻', '👨‍🎓', '👩‍🎨', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧑‍🔬', '👨‍🚀'];

export function generateRandomOrder(state: GameState): CustomerOrder | null {
  // Only order unlocked products that have stock > 0
  const availableProducts = state.products.filter(p => p.unlocked && p.stock > 0);
  if (availableProducts.length === 0) return null;

  // Decide how many items this customer wants (1 to 3 items)
  const numDistinctItems = Math.min(availableProducts.length, Math.random() > 0.7 ? 2 : 1);
  const shuffled = [...availableProducts].sort(() => Math.random() - 0.5);
  const chosenProducts = shuffled.slice(0, numDistinctItems);

  const items = chosenProducts.map(p => {
    // Quantity: mostly 1, occasionally 2 or 3
    const maxQty = Math.min(p.stock, Math.random() > 0.8 ? 3 : (Math.random() > 0.5 ? 2 : 1));
    return {
      productId: p.id,
      quantity: Math.max(1, maxQty),
      unitPrice: p.sellingPrice,
    };
  });

  const totalPrice = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);

  // Shipping choice
  const randShip = Math.random();
  const shippingMethod: 'standard' | 'express' | 'drone' = 
    randShip > 0.85 && state.warehouseTier >= 2 ? 'drone' :
    randShip > 0.5 ? 'express' : 'standard';

  const baseShippingCost = shippingMethod === 'drone' ? 35 : shippingMethod === 'express' ? 18 : 10;
  
  // Apply any active event effects to shipping
  const shippingMultiplier = state.activeEvents.reduce((acc, evt) => {
    return acc * (evt.effect.shippingCostMultiplier || 1.0);
  }, 1.0);

  const shippingCost = Math.round(baseShippingCost * shippingMultiplier);

  const custName = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

  // Time remaining to pack: 45 to 90 seconds
  const maxTimeSeconds = shippingMethod === 'drone' ? 35 : shippingMethod === 'express' ? 50 : 75;

  return {
    id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerName: custName,
    customerAvatar: avatar,
    items,
    totalPrice,
    orderedAtDay: state.currentDay,
    status: 'pending',
    shippingMethod,
    shippingCost,
    timeRemainingSeconds: maxTimeSeconds,
    maxTimeSeconds,
    packProgress: 0,
  };
}

export function generateCustomerReview(order: CustomerOrder, success: boolean, products: GameState['products'], currentDay: number): CustomerReview {
  const prod = products.find(p => p.id === order.items[0]?.productId);
  const prodName = prod ? prod.name : 'Produtos';

  if (!success) {
    const badComments = [
      'O pedido demorou demais para ser enviado e perdi o aniversário da minha esposa!',
      'Fiz a compra há dias e o envio atrasou. Precisei cobrar no suporte.',
      'Muito demorado. Melhorem a velocidade de empacotamento!',
      'A embalagem chegou amassada e o prazo não foi cumprido.',
    ];
    return {
      id: `rev-${Date.now()}`,
      customerName: order.customerName,
      rating: Math.floor(Math.random() * 2) + 1, // 1 or 2 stars
      comment: badComments[Math.floor(Math.random() * badComments.length)],
      day: currentDay,
      productName: prodName,
      orderId: order.id,
    };
  }

  // Good reviews
  const goodComments = [
    'Chegou super rápido! O pacote veio lacrado e impecável. Recomendo demais!',
    'Excelente experiência de compra. O produto superou minhas expectativas.',
    'Nota 10! Embalado com carinho e fita reforçada. Comprarei de novo com certeza.',
    'Entrega relâmpago! Produto original e muito bem protegido.',
    'Atendimento ágil e despacho no mesmo dia. Virei cliente fiel!',
  ];
  return {
    id: `rev-${Date.now()}`,
    customerName: order.customerName,
    rating: Math.random() > 0.2 ? 5 : 4,
    comment: goodComments[Math.floor(Math.random() * goodComments.length)],
    day: currentDay,
    productName: prodName,
    orderId: order.id,
  };
}

export const POSSIBLE_EVENTS: Omit<MarketEvent, 'id' | 'daysLeft'>[] = [
  {
    title: '🔥 Black Friday Antecipada!',
    description: 'Uma onda gigantesca de compradores inundou as lojas virtuais! Tráfego e pedidos aumentados em 250% pelos próximos 2 dias.',
    category: 'black_friday',
    durationDays: 2,
    effect: {
      trafficMultiplier: 2.5,
    }
  },
  {
    title: '📱 Tendência Viral no TikTok: Acessórios Tech!',
    description: 'Vídeos de mesa de trabalho estética viralizaram nas redes! A procura por Acessórios e Utilidades disparou.',
    category: 'trend',
    durationDays: 3,
    effect: {
      categoryBoost: 'accessories',
      boostMultiplier: 2.2,
      trafficMultiplier: 1.4,
    }
  },
  {
    title: '🎮 Campeonato de E-Sports em Alta!',
    description: 'As finais do mundial de e-sports aumentaram o desejo de jogadores por periféricos e cadeiras gamer.',
    category: 'trend',
    durationDays: 3,
    effect: {
      categoryBoost: 'gaming',
      boostMultiplier: 2.5,
      trafficMultiplier: 1.5,
    }
  },
  {
    title: '🚚 Greve Temporária nas Transportadoras',
    description: 'Bloqueios e paralisações elevaram os custos de frete em 40% durante as próximas 48 horas.',
    category: 'crisis',
    durationDays: 2,
    effect: {
      shippingCostMultiplier: 1.4,
    }
  },
  {
    title: '⚡ Cupom Relâmpago Noticiado na TV',
    description: 'Seu e-commerce foi mencionado em um blog de economia como exemplo de entrega rápida. Tráfego em alta!',
    category: 'opportunity',
    durationDays: 2,
    effect: {
      trafficMultiplier: 1.8,
    }
  },
  {
    title: '🏠 Febre de Casa Inteligente!',
    description: 'Artigos sobre automação residencial impulsionam as compras na categoria de Casa Inteligente.',
    category: 'trend',
    durationDays: 3,
    effect: {
      categoryBoost: 'home',
      boostMultiplier: 2.4,
      trafficMultiplier: 1.3,
    }
  }
];

export function getRandomEvent(): MarketEvent {
  const template = POSSIBLE_EVENTS[Math.floor(Math.random() * POSSIBLE_EVENTS.length)];
  return {
    ...template,
    id: `evt-${Date.now()}`,
    daysLeft: template.durationDays,
  };
}
