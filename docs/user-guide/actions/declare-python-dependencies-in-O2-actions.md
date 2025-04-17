Declaring dependencies is an important aspect when creating your Action script in Python. If your script relies on external libraries, you must specify them using one of the supported methods outlined below:

- `pyproject.toml` File
- `dependencies` Folder

Click the following tabs to know more.

=== "`pyproject.toml` File" 

    Add your dependencies inside the `pyproject.toml` file. The Action Runner will install these packages on the fly when running your action.  
    ```  linenums="1"
    [build-system]  
    requires = ["hatchling"]  
    build-backend = "hatchling.build"

    [project]  
    name = "python_uv_sample"  
    version = "0.1.0"  
    description = "A sample Python project using uv"  
    requires-python = ">=3.8"  
    dependencies = [  
        "requests>=2.28.0",  
    ]

    [tool.hatch.build.targets.wheel]  
    packages = ["action_scheduled"]

    ```

    - **Pro**: Smaller ZIP size.  
    - **Con**: Action startup might be slower because dependencies are installed at runtime.


=== "dependencies Folder"

    Pre-install all needed libraries into a dependencies folder using the uv package manager.

    **Pros:**

    - Faster startup as dependencies are already available when the action starts.  
    - No need to install anything during execution.

    **Con:**

    - Larger ZIP file. You upload all packages at once, **but only once**.

    ### How to create the `dependencies` folder  
    ```  
    uv pip install package1 package2 --target dependencies  
    ```  
    **Example:**  
    `uv pip install requests pandas --target dependencies`   
    The above command installs requests and pandas packages into a local folder called dependencies.

    When you use dependencies folder, the structure of the zipped folder looks like the following:  
    ```bash
    my_action.zip  
    ├── main.py  
    ├── dependencies/  
    │   ├── requests/  
    │   ├──... 
    ```