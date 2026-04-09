'use client';

export function TestForm() {
  console.log('TestForm rendering...');
  return (
    <div className="glass p-8 m-4">
      <h2 className="text-2xl font-bold text-white mb-4">Test Form Component</h2>
      <p className="text-white">If you can see this, the component system is working.</p>
      <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">
        Test Button
      </button>
    </div>
  );
}
