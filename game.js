// ========================================
// LOADER - Charge le jeu depuis Firebase
// ========================================

(async function() {
  console.log('🔄 Chargement du jeu depuis Firebase...');
  
  try {
    // Charger le code du jeu depuis Firebase
    const response = await fetch(`${FIREBASE_DB_URL}/game_code.json?auth=${FIREBASE_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Impossible de charger le jeu depuis Firebase');
    }
    
    const gameCode = await response.json();
    
    if (!gameCode || !gameCode.code) {
      throw new Error('Code du jeu non trouvé dans Firebase');
    }
    
    console.log('✅ Code du jeu chargé depuis Firebase');
    
    // Exécuter le code du jeu
    eval(gameCode.code);
    
    console.log('✅ Jeu initialisé depuis Firebase');
    
  } catch (error) {
    console.error('❌ Erreur de chargement:', error);
    document.getElementById('updateStatus').textContent = 'Erreur: ' + error.message;
    document.getElementById('updateStatus').style.background = 'rgba(244, 67, 54, 0.9)';
    document.getElementById('updateStatus').style.color = 'white';
  }
})();

