'use client';

export function SimpleTest() {
  console.log('SimpleTest rendering...');
  return (
    <div 
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        margin: '20px',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}
    >
      SIMPLE TEST COMPONENT
      <br />
      If you can see this, the component system works!
      <br />
      <button 
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          marginTop: '10px'
        }}
      >
        Test Button
      </button>
    </div>
  );
}
