import React, {useState} from 'react';

type Tenant = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  unitNumber: number;
}

function App() {

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    unitNumber: 0,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const addTenant = () => {
    const newTenant = { ...formData, id: formData.id || Math.max(0, ...tenants.map(t => t.id)) + 1 };
    if (selectedTenant) {
      setTenants(tenants.map(t => t.id === selectedTenant.id ? newTenant : t));
    } else {
      setTenants([...tenants, newTenant]);
    }
    setShowForm(false);
    setSelectedTenant(null);
  };

  const editTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData(tenant);
    setShowForm(true);
  };


  return (
    <div className="App">
      
      <div className='text-slate-800 text-left text-3xl font-bold m-6'>
        <h1>Property Manager Pro</h1>
      </div>

      <div className=' flex flex-row h-screen'>

        <div id="first column" className=' m-6 bg-zinc-300 text-slate-800 w-2/5 h-5/6 rounded-lg'>
          <p className='text-left text-2xl font-semibold m-5'>
            Tenants
          </p>
          {tenants.map((tenant) => (
            <div className='px-3 py-2 bg-slate-500  ' key={tenant.id} onClick={() => editTenant(tenant)}>
              {tenant.firstName} {tenant.lastName}
            </div>

          ))}
          <div className='w-full flex justify-center '>
            <button onClick={() => { setShowForm(true); setSelectedTenant(null); setFormData({ id: 0, firstName: '', lastName: '', phoneNumber: '', email: '', unitNumber: 0 }); }}
             className='bg-stone-50 px-5 py-2 my-2 rounded-full hover:bg-stone-200 hover:drop-shadow-xl active:bg-stone-300 ffocus:outline-none focus:ring-stone-300'>
              Add Tenant
            </button>
            
          </div>
        </div>

        <div id="second column" className='  p-4 m-6 bg-zinc-300 text-slate-800 w-3/5 h-5/6 rounded-lg flex flex-col items-center justify-center'>
          <div className='relative bg-zinc-500 w-full h-full mb-2 rounded-lg p-3'>
            <p className='text-2xl font-semibold ml-5'>
              Tenant Info
            </p>
            <div id='tenant info' className='p-5 space-y-2 w-full'>
              {showForm && (
                <div className='p-5 space-y-2 w-full space-x-10'>
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-field" />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-field" />
                  <input type="phone" name="phoneNumber" placeholder="(555)-555-5555" value={formData.phoneNumber} onChange={handleInputChange} className="input-field" />
                  <input type="email" name="email" placeholder="johndoe@email.com" value={formData.email} onChange={handleInputChange} className="input-field" />
                  <button onClick={addTenant} className='save-button bg-stone-50 px-5 py-2 rounded-full hover:bg-stone-200 hover:drop-shadow-xl active:bg-stone-300 ffocus:outline-none focus:ring-stone-300'>
                    Save
                  </button>
                </div>
              )}

            </div>
          </div>
          <div className='bg-zinc-500 w-full h-full mt-2 rounded-lg p-3'>
            <p className='text-2xl font-semibold ml-5'>
              Units
              {/*was supposed to be something but i got stuck in figuring out state for the most part and didn't have time to finish the full idea*/}
            </p>
            <div id='Units' className=''>

            </div>
          </div>

        </div>


      </div>
    </div>
  );
}

export default App;
