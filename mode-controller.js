// ========================================
// CONTRÔLEUR DE MODE - Charge depuis Firebase
// ========================================

(async function() {
  console.log('🔄 Chargement du contrôleur depuis Firebase...');
  
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/controller_code.json?auth=${FIREBASE_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Impossible de charger le contrôleur depuis Firebase');
    }
    
    const controllerCode = await response.json();
    
    if (!controllerCode || !controllerCode.code) {
      throw new Error('Code du contrôleur non trouvé dans Firebase');
    }
    
    console.log('✅ Contrôleur chargé depuis Firebase');
    
    // Exécuter le code du contrôleur
    eval(controllerCode.code);
    
  } catch (error) {
    console.error('❌ Erreur de chargement du contrôleur:', error);
  }
})();

